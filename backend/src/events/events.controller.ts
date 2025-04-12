import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  UseInterceptors,
  UploadedFiles,
  MaxFileSizeValidator,
  ParseFilePipe,
  FileTypeValidator,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { FileUploadService } from '../services/file-upload.service';
import { multerConfig } from '../config/multer.config';
import { NotificationService } from '../notifications/notification.service';

interface MulterFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
}

@Controller('events')
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly fileUploadService: FileUploadService,
    private readonly notificationService: NotificationService,
  ) {}

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files', 20, multerConfig))
  async uploadFiles(
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 10 }), // 10MB
          new FileTypeValidator({ fileType: '.(jpg|jpeg|png|gif|mp4|webm)' }),
        ],
      }),
    )
    files: MulterFile[],
  ) {
    const uploadedFiles = await Promise.all(
      files.map(async (file) => {
        const type = file.mimetype.startsWith('image/') ? 'image' : 'video';
        return this.fileUploadService.uploadFile(file, type);
      }),
    );
    return { urls: uploadedFiles };
  }

  @Post()
  create(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(createEventDto);
  }

  @Get()
  findAll() {
    return this.eventsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    const oldEvent = await this.eventsService.findOne(id);
    if (oldEvent) {
      const oldFiles = [...(oldEvent.images || []), ...(oldEvent.videos || [])];
      const newFiles = [
        ...(updateEventDto.images || []),
        ...(updateEventDto.videos || []),
      ];
      const filesToDelete = oldFiles.filter((file) => !newFiles.includes(file));

      await Promise.all(
        filesToDelete.map((file) => this.fileUploadService.deleteFile(file)),
      );
    }
    return this.eventsService.update(id, updateEventDto);
  }

  @Put(':id')
  replace(@Param('id') id: string, @Body() createEventDto: CreateEventDto) {
    return this.eventsService.replace(id, createEventDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const event = await this.eventsService.findOne(id);
    if (event) {
      // Delete all associated files
      const files = [...(event.images || []), ...(event.videos || [])];
      await Promise.all(
        files.map((file) => this.fileUploadService.deleteFile(file)),
      );
    }
    return this.eventsService.remove(id);
  }

  @Post(':id/snooze')
  async snoozeEvent(
    @Param('id') id: string,
    @Body() body: { minutes: number },
  ) {
    return this.notificationService.snoozeEvent(id, body.minutes);
  }
}
